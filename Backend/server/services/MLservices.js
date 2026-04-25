import axios from "axios";
import FormData from "form-data";

export const sendToML = async (file) => {
  const form = new FormData();

  form.append("file", file.buffer, file.originalname);

  const response = await axios.post(
    "http://127.0.0.1:8000/analyze",
    form,
    {
      headers: form.getHeaders(),
    }
  );

  return response.data;
};