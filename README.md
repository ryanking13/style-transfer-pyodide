# style-transfer-pyodide

A simple proof-of-concept of running deep learning model in the browser using Pyodide + OpenCV DNN module.

Codes are based on:

- [fast-neural-style-pytorch](https://github.com/rrmina/fast-neural-style-pytorch)
- [Nuxt.js web worker example](https://github.com/nuxt/nuxt.js/tree/dev/examples/web-worker)

## Usage

### Running web application

```sh
cd style-transfer-pyodide
npm install
npm run dev
```

### (optional) Converting torch model to onnx model

```sh
git submodule init && git submodule update
cd python
pip install -r requirements.txt

python convert.py  # convert torch model to onnx
python stylize.py  # run inference with OpenCV DNN module (for test)
```