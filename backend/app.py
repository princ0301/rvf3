import os
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'

from flask import Flask, request, jsonify
import tensorflow
from tensorflow import keras
from keras.models import load_model
from keras.preprocessing import image
import numpy as np
import os

app = Flask(__name__)

# Load the model
model = load_model('model_vgg16_01.h5')

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Save the file temporarily
    filepath = os.path.join('uploads', file.filename)
    file.save(filepath)

    # Preprocess the image and make a prediction
    img_array = preprocess_image(filepath)
    prediction = model.predict(img_array)

    # Clean up
    os.remove(filepath)

    # Convert prediction to class label
    is_ai_generated = bool(np.argmax(prediction))
    result = 'AI-Generated' if is_ai_generated else 'Real'
    
    return jsonify({'result': result, 'confidence': float(np.max(prediction))})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
