# from flask import Flask, request, jsonify
# import deepspeech
# import numpy as np
# import wave
# import io

# app = Flask(__name__)

# # Load DeepSpeech model
# model_file_path = 'deepspeech-0.9.3-models.pbmm'
# scorer_file_path = 'deepspeech-0.9.3-models.scorer'
# model = deepspeech.Model(model_file_path)
# model.enableExternalScorer(scorer_file_path)

# def convert_audio_to_text(audio):
#     # Read audio file
#     with wave.open(io.BytesIO(audio), 'rb') as wf:
#         frames = wf.getnframes()
#         buffer = wf.readframes(frames)
#         audio = np.frombuffer(buffer, dtype=np.int16)

#     # Run DeepSpeech
#     text = model.stt(audio)
#     return text

# @app.route('/transcribe', methods=['POST'])
# def transcribe():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file part'})
#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'})

#     audio = file.read()
#     text = convert_audio_to_text(audio)
#     return jsonify({'text': text})

# if __name__ == '__main__':
#     app.run(debug=True)
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
