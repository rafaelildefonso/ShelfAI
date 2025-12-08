import axios from "axios";
import { buildApiPath } from "../config/api";
import { toast } from "react-toastify";

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const endpoint = buildApiPath("/api/files/upload/product");
  try {
    const response = await axios.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.url;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      toast.error("Muitas requisições de upload. Aguarde um momento.");
    }
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  const endpoint = buildApiPath("/api/files/delete/product");
  await axios.delete(endpoint, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    data: { imageUrl },
  });
};
