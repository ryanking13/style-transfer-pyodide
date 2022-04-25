import sys
sys.path.append("fast-neural-style-pytorch")

import transformer  # fast-neural-style-pytorch/transformer
import torch

def convert(style_transform_path, width, height):
    device = "cpu"
    print("Loading Transformer Network")
    net = transformer.TransformerNetwork()
    net.load_state_dict(torch.load(style_transform_path))
    net = net.to(device)
    print("Done Loading Transformer Network")

    dummy_input = torch.randn(1, 3, height, width).to(device)
    input_names = [ "ConvBlock.0.conv_layer" ]
    output_names = [ "DeconvBlock.4.conv_layer" ]
    torch.onnx.export(net, dummy_input, "style_transfer.onnx", verbose=True, input_names=input_names, output_names=output_names)

convert(
    style_transform_path="fast-neural-style-pytorch/transforms/mosaic.pth",
    width=1280,
    height=720,
)
