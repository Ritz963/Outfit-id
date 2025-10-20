import sys
from rembg import remove
import os

input_path = sys.argv[1]

base, ext = os.path.splitext(input_path)
output_path = f"{base}_out{ext}"

with open(input_path, 'rb') as i:
    with open(output_path, 'wb') as o:
        input_data = i.read()
        output_data = remove(input_data)
        o.write(output_data)

print(output_path)

