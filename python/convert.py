import sys
sys.path.append("fast-neural-style-pytorch")

import experimental  # fast-neural-style-pytorch/experimental
import torch

def convert(style_transform_path, width, height):
    device = "cpu"
    print("Loading Transformer Network")
    net = experimental.TransformerResNextNetwork_Pruned(alpha=1.0)
    net.load_state_dict(torch.load(style_transform_path))
    net = net.to(device)
    print("Done Loading Transformer Network")

    dummy_input = torch.randn(1, 3, height, width).to(device)
    input_names = [ "ConvBlock.0.conv_layer" ]
    output_names = [ "DeconvBlock.4.conv_layer" ]
    torch.onnx.export(
        net,
        dummy_input,
        "model.onnx",
        verbose=False,
        input_names=input_names,
        output_names=output_names
    )

convert(
    # style_transform_path="fast-neural-style-pytorch/transforms/mosaic.pth",
    style_transform_path="weights/mosaic_TransformerResNextNetwork_Pruned10.pth",
    width=640,
    height=360,
)
