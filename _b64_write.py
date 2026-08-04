import base64,sys,pathlib
pathlib.Path(sys.argv[1]).write_bytes(base64.b64decode(sys.argv[2]))
