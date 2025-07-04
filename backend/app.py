from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io  
import logging
import csv
import tempfile

from utils.preprocess import preprocess_image
from model.class_names import CLASS_NAMES
from utils.visualize import generate_confidence_chart

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load model once
try:
    model = tf.keras.models.load_model("model/brain_tumor_class.keras")
    print("[INFO] Model loaded successfully.")
except Exception as e:
    print("[ERROR] Failed to load model:", e)
    raise
@app.route("/predict", methods=["POST"])
def predict():
    if 'images' not in request.files:
        return jsonify({"error": "No image files provided."}), 400

    files = request.files.getlist("images")
    if not files:
        return jsonify({"error": "Empty file list."}), 400

    results = []

    for file in files:
        try:
            img_data = file.read()
            if not img_data:
                continue

            original = Image.open(io.BytesIO(img_data)).convert("RGB")
            preprocessed = preprocess_image(img_data)
            prediction = model.predict(preprocessed)[0]
            pred_idx = np.argmax(prediction)
            confidence = float(prediction[pred_idx])

            # Generate scores and chart
            scores = {CLASS_NAMES[i]: round(float(p)*100, 4) for i, p in enumerate(prediction)}
            confidence_chart = generate_confidence_chart(scores)

            results.append({
                "filename": file.filename,
                "prediction": CLASS_NAMES[pred_idx],
                "confidence": round(confidence * 100, 2),
                "scores": scores,
                "chart": confidence_chart  # base64 string
            })

        except Exception as e:
            logging.exception(f"Failed to process file: {file.filename}")
            results.append({
                "filename": file.filename,
                "error": "Failed to process this image."
            })

    return jsonify(results)

@app.route("/predict-csv", methods=["POST"])
def predict_csv():
    if 'images' not in request.files:
        return jsonify({"error": "No image files provided."}), 400

    files = request.files.getlist("images")
    if not files:
        return jsonify({"error": "Empty file list."}), 400

    temp_csv = tempfile.NamedTemporaryFile(delete=False, mode='w', newline='', suffix=".csv")
    writer = csv.writer(temp_csv)
    writer.writerow(["Filename", "Prediction", "Confidence", "Glioma", "Meningioma", "Pituitary", "No Tumor"])

    for file in files:
        try:
            img_data = file.read()
            if not img_data:
                continue

            original = Image.open(io.BytesIO(img_data)).convert("RGB")
            preprocessed = preprocess_image(img_data)
            prediction = model.predict(preprocessed)[0]
            pred_idx = np.argmax(prediction)
            confidence = float(prediction[pred_idx])
            scores = [round(float(p) * 100, 4) for p in prediction]

            writer.writerow([
                file.filename,
                CLASS_NAMES[pred_idx],
                round(confidence * 100, 4),
                *scores
            ])

        except Exception as e:
            logging.exception(f"Failed to process file: {file.filename}")
            writer.writerow([
                file.filename,
                "Error",
                "N/A",
                "N/A", "N/A", "N/A", "N/A"
            ])

    temp_csv.close()
    return send_file(temp_csv.name, as_attachment=True, download_name="Brain_tumor_pred.csv")

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "Brain tumor classifier backend is running."})

if __name__ == "__main__":
    app.run(debug=True)
