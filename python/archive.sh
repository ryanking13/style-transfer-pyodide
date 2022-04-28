#!/bin/bash

tar -cvf style_transfer.tar stylize.py model.onnx
gzip style_transfer.tar