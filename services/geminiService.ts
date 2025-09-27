import { GoogleGenAI, Modality } from "@google/genai";

// Create a single AI client instance using the built-in API key.
const getAiClient = () => {
    // The API key is now expected to be in the environment variables.
    if (!process.env.API_KEY) {
        throw new Error("API Key is not configured. Please set the API_KEY environment variable.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const handleApiError = (error: unknown, context: string): Error => {
    console.error(`Error in ${context}:`, error);
    if (error instanceof Error) {
        if (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("quota exceeded")) {
            return new Error("Lỗi Hạn Ngạch API: Hạn ngạch của API Key tích hợp đã hết. Vui lòng thử lại sau.");
        }
        if (error.message.includes("API key not valid")) {
            return new Error("Lỗi API Key: API Key tích hợp không hợp lệ.");
        }
    }
    // Lỗi chung
    return new Error(`Đã xảy ra lỗi khi ${context.toLowerCase()}. Vui lòng thử lại.`);
};


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                // remove data:image/jpeg;base64,
                resolve((reader.result as string).split(',')[1]);
            } else {
                reject(new Error("Không thể đọc file."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const fileToGenerativePart = async (file: File) => {
  const base64Data = await fileToBase64(file);
  return {
    inlineData: { data: base64Data, mimeType: file.type },
  };
};

// Chức năng 1: Bóc tách trang phục (Tự động hóa)
export const separateApparel = async (image: File): Promise<string[]> => {
  const imagePart = await fileToGenerativePart(image);
  
  const prompt = `Từ hình ảnh được cung cấp, hãy tách riêng toàn bộ trang phục (áo, quần, váy) và tất cả phụ kiện đi kèm (giày, túi xách, mũ, kính...) ra khỏi người mẫu và nền. Đặt tất cả các vật phẩm đã tách lên một nền trắng hoàn toàn. Kết quả cuối cùng chỉ được chứa hình ảnh của trang phục và phụ kiện, giữ nguyên chi tiết, màu sắc và họa tiết.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    const results: string[] = [];
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                results.push(imageUrl);
            }
        }
    }
    if (results.length === 0) {
        throw new Error("Không thể tách trang phục. Vui lòng thử lại với ảnh khác.");
    }
    return results;
  } catch (error) {
    throw handleApiError(error, "tách trang phục");
  }
};

// Chức năng 2: Người mẫu (Tự động hóa)
export const createModelImage = async (
  modelImage: File,
  outfitImage: File,
): Promise<string[]> => {
  const modelPart = await fileToGenerativePart(modelImage);
  const outfitPart = await fileToGenerativePart(outfitImage);
  
  const detailedPrompt = `Thực hiện chỉnh sửa ảnh chuyên nghiệp:
1.  **Chủ thể**: Lấy người mẫu từ ảnh đầu tiên. Giữ nguyên 100% khuôn mặt, vóc dáng, mái tóc, màu da của người mẫu.
2.  **Trang phục**: Lấy bộ trang phục từ ảnh thứ hai. Mặc bộ trang phục này cho người mẫu một cách tự nhiên và vừa vặn. Giữ nguyên tuyệt đối kiểu dáng, màu sắc, và họa tiết của trang phục.
3.  **Bối cảnh**: Tự động tạo một bối cảnh (background) phù hợp với phong cách của trang phục (ví dụ: đường phố, studio, quán cà phê, thiên nhiên...).
4.  **Kết quả**: Tạo ra một bức ảnh chân thực, chất lượng cao, tỉ lệ 9:16, trông giống như ảnh chụp từ một buổi chụp hình thời trang chuyên nghiệp.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          modelPart,
          outfitPart,
          { text: detailedPrompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const results: string[] = [];
    let feedbackText = ""; 

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                results.push(imageUrl);
            } else if (part.text) {
                feedbackText += part.text + " ";
            }
        }
    }
    
    if (results.length === 0) {
        const errorMessage = feedbackText.trim() 
            ? `AI không thể tạo ảnh: ${feedbackText}` 
            : "Không thể tạo ảnh người mẫu. Vui lòng thử lại với ảnh khác hoặc mô tả đơn giản hơn.";
        throw new Error(errorMessage);
    }
    return results;

  } catch (error) {
     throw handleApiError(error, "tạo ảnh người mẫu");
  }
};

// Chức năng 3: Góc nhìn khác (Tối ưu tốc độ & Tự động hóa)
export const generateDifferentPerspectives = async (
  referenceImage: File
): Promise<string[]> => {
  const imagePart = await fileToGenerativePart(referenceImage);
  
  const generationPrompt = `Từ trang phục trong ảnh gốc, hãy tạo ra một bộ sưu tập ảnh sản phẩm chuyên nghiệp.
YÊU CẦU:
1.  **Ảnh Treo Giá**: Tạo một hình ảnh trang phục được treo gọn gàng trên một chiếc giá treo đồ bằng gỗ, phông nền là một bức tường trắng.
2.  **Ảnh Gấp Gọn (Flat Lay)**: Tạo một hình ảnh trang phục được gấp ngay ngắn và đặt trên một mặt phẳng sạch sẽ (ví dụ: nền gỗ sáng màu hoặc nền bê tông).
3.  **Ảnh Chi Tiết**: Tạo một hình ảnh chụp cận cảnh vào một chi tiết đặc sắc của trang phục như chất liệu vải, đường may, hoặc họa tiết.
QUAN TRỌNG: Tất cả các ảnh tạo ra phải giữ lại chính xác 100% chi tiết, màu sắc, kiểu dáng của trang phục gốc.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          imagePart,
          { text: generationPrompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    const results: string[] = [];
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                results.push(imageUrl);
            }
        }
    }

    if (results.length === 0) {
        throw new Error("Không có ảnh nào được tạo. Vui lòng thử với ảnh tham chiếu rõ nét hơn.");
    }

    return results;
  } catch (error) {
    throw handleApiError(error, "tạo bộ ảnh sản phẩm");
  }
};

// Chức năng 4: Tạo dáng chuyên nghiệp
export const generateProfessionalPoses = async (
  referenceImage: File
): Promise<string[]> => {
  const imagePart = await fileToGenerativePart(referenceImage);

  const prompt = `Từ hình ảnh gốc, hãy giữ nguyên người mẫu và trang phục. Tạo ra một bộ sưu tập ảnh mới, trong đó người mẫu thực hiện các kiểu tạo dáng (pose) thời trang chuyên nghiệp khác nhau.
YÊU CẦU:
1.  **Dáng đi (Walking Pose)**: Tạo một ảnh người mẫu đang bước đi tự nhiên trên đường phố hoặc trong studio.
2.  **Dáng tựa (Leaning Pose)**: Tạo một ảnh người mẫu đang tựa nhẹ vào một bức tường hoặc lan can.
3.  **Dáng nhìn qua vai (Over-the-Shoulder Pose)**: Tạo một ảnh người mẫu nhìn qua vai về phía máy ảnh.
QUAN TRỌNG: Giữ lại chính xác 100% khuôn mặt của người mẫu và các chi tiết, màu sắc, kiểu dáng của trang phục gốc. Đặt người mẫu trong một bối cảnh phù hợp và nhất quán.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const results: string[] = [];
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes = part.inlineData.data;
          const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          results.push(imageUrl);
        }
      }
    }

    if (results.length === 0) {
      throw new Error("Không thể tạo bộ ảnh tạo dáng. Vui lòng thử với ảnh tham chiếu rõ nét hơn.");
    }

    return results;
  } catch (error) {
    throw handleApiError(error, "tạo bộ ảnh lookbook");
  }
};

// Chức năng 5: Tạo video chuyển động
export const generateMotionVideo = async (
  referenceImage: File,
  model: string,
  aspectRatio: '9:16' | '16:9'
): Promise<string> => {
  const ai = getAiClient();
  const imageBytes = await fileToBase64(referenceImage);
  const imagePart = {
    inlineData: { data: imageBytes, mimeType: referenceImage.type },
  };

  // Tự động tạo prompt mô tả chuyển động sáng tạo
  const promptForMotionDescription = `Từ hình ảnh này, hãy tạo một mô tả chuyển động sáng tạo để tạo video. Hãy tập trung vào một trong các ý tưởng sau: 
1. Sự co giãn, gợn sóng, hoặc bay bổng của chất liệu vải. 
2. Một dáng pose xoay vòng 360 độ đầy nghệ thuật để khoe trọn bộ trang phục. 
3. Một sự chuyển đổi dáng pose đầy năng lượng và sáng tạo.
Chỉ trả về duy nhất một mô tả chuyển động ngắn gọn, không thêm lời dẫn hay đánh số.`;
  
  let autoPrompt = "người mẫu thực hiện một vòng xoay 360 độ đầy thanh lịch"; // Prompt mặc định
  try {
      const descriptionResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, { text: promptForMotionDescription }] },
      });
      if (descriptionResponse.text) {
          autoPrompt = descriptionResponse.text.trim();
      }
  } catch (e) {
      console.warn("Không thể tự động tạo prompt, đang sử dụng prompt mặc định.", e);
  }

  const fullPrompt = `Từ hình ảnh tĩnh, tạo một video ngắn (khoảng 3-5 giây) đầy nghệ thuật. Giữ nguyên 100% người mẫu và trang phục. Thêm chuyển động sáng tạo và độc đáo dựa trên mô tả sau: ${autoPrompt}`;

  try {
    let operation = await ai.models.generateVideos({
      model: model,
      prompt: fullPrompt,
      image: {
        imageBytes: imageBytes,
        mimeType: referenceImage.type,
      },
      config: {
        numberOfVideos: 1,
        // The Video Generation API might not officially support aspectRatio yet, but including it for future compatibility.
        aspectRatio: aspectRatio,
      },
    });
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Không thể lấy đường dẫn tải xuống video từ phản hồi của API.");
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        const errorText = await videoResponse.text();
        throw new Error(`Lỗi khi tải video: ${videoResponse.statusText}. Chi tiết: ${errorText}`);
    }
    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);

    return videoUrl;
  } catch (error) {
    throw handleApiError(error, "tạo video chuyển động");
  }
};

// Chức năng 6: Storyboard AI
export const generateMotionPromptsForImages = async (
  images: File[]
): Promise<string[]> => {
    if (images.length === 0) {
        return [];
    }

    try {
        const ai = getAiClient();
        
        const imageParts = await Promise.all(images.map(fileToGenerativePart));
        
        const prompt = `Phân tích từng hình ảnh theo thứ tự được cung cấp. Đối với mỗi hình ảnh, hãy viết một mô tả chuyển động (prompt) ngắn gọn, sáng tạo, và phù hợp để tạo thành một video ngắn. Chỉ trả về một mảng JSON chứa các chuỗi string, mỗi chuỗi là một prompt tương ứng với một hình ảnh. Ví dụ: ["prompt cho ảnh 1", "prompt cho ảnh 2"]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, ...imageParts] },
            config: {
                responseMimeType: "application/json",
            },
        });

        const jsonText = response.text.trim();
        const prompts = JSON.parse(jsonText);

        if (!Array.isArray(prompts) || prompts.length !== images.length) {
            throw new Error("AI đã trả về dữ liệu không hợp lệ. Số lượng prompt không khớp với số lượng ảnh.");
        }

        return prompts.map(p => String(p));

    } catch (error) {
        if (error instanceof SyntaxError) {
             throw new Error("AI đã trả về phản hồi không phải là JSON hợp lệ. Vui lòng thử lại.");
        }
        throw handleApiError(error, "tạo storyboard");
    }
};