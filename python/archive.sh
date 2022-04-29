#!/bin/bash

tar -cvf style_transfer.tar stylize.py *.onnx
gzip style_transfer.tar