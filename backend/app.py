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

def predict_image(img_path, class_names=['Fake', 'Real']):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0

    prediction = model.predict(img_array)
    probability = prediction[0][0]
    predicted_class = class_names[int(np.round(probability))]
    confidence = abs(probability - 0.5) * 2 * 100  

    return predicted_class, confidence

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    if file:
        file_path = os.path.join('uploads', file.filename)
        file.save(file_path)
        
        predicted_class, confidence = predict_image(file_path)
        return jsonify({'prediction': predicted_class, 'confidence': confidence})
    
    return jsonify({'error': 'Invalid file format'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
