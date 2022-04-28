import cv2 as cv

net = None

def initialize_network(onnx_path):
    global net 
    net = cv.dnn.readNet(onnx_path)
    # print(net.getLayerNames())


def stylize(img_path, width=None, height=None):
    img = cv.imread(img_path, cv.IMREAD_COLOR)
    h, w, c = img.shape

    if width is None:
        width = w
    if height is None:
        height = h
        
    blob = cv.dnn.blobFromImage(img, 1.0, (w, h))
    net.setInput(blob)
    out = net.forward()
    out = out.squeeze()
    out = out.transpose(1, 2, 0)
    out = out.clip(0, 255)

    return out

if __name__ == "__main__":
    initialize_network("model.onnx")
    out = stylize("fast-neural-style-pytorch/images/up-diliman.jpg")
    cv.imwrite("stylized.jpg", out)