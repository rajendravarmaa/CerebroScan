import axios from 'axios';

export const uploadImages = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach(file => formData.append("images", file));
  const res = await axios.post("http://localhost:5000/predict", formData);
  return res.data;
};
