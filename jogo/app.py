from flask import Flask, request, render_template, redirect, url_for
import os
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans
import json

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/jogo')
def jogo():
    return render_template('jogo.html')

@app.route('/processar', methods=['POST'])
def processar():
    imagem = request.files['imagem']
    caminho = os.path.join(UPLOAD_FOLDER, 'imagem.jpg')
    imagem.save(caminho)

    ALTURA, LARGURA = 128, 128
    NUM_CORES = 25

    img = Image.open(caminho).convert("RGB")
    img = img.resize((LARGURA, ALTURA))
    img_np = np.array(img).reshape(-1, 3)

    kmeans = KMeans(n_clusters=NUM_CORES, random_state=0).fit(img_np)
    rotulos = kmeans.predict(img_np)
    cores = kmeans.cluster_centers_.astype(np.uint8)

    matriz_numeros = (rotulos.reshape((ALTURA, LARGURA)) + 1).tolist()
    paleta = cores.tolist()

    with open('static/grid.json', 'w') as f:
        json.dump(matriz_numeros, f)

    with open('static/paleta.json', 'w') as f:
        json.dump(paleta, f)

    return redirect(url_for('jogo'))

if __name__ == '__main__':
    app.run(debug=True)