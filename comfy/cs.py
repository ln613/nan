from comfy_script.runtime import *
load()
from comfy_script.runtime.nodes import *

with Workflow():
    model, clip, vae = CheckpointLoaderSimple('flux1-dev-fp8.safetensors')

    positive_conditioning = CLIPTextEncode('cute anime girl with massive fluffy fennec ears and a big fluffy tail blonde messy long hair blue eyes wearing a maid outfit with a long black gold leaf pattern dress and a white apron mouth open placing a fancy black forest cake with candles on top of a dinner table of an old dark Victorian mansion lit by candlelight with a bright window to the foggy forest and very expensive stuff everywhere there are paintings on the walls', clip)
    positive_conditioning = FluxGuidance(positive_conditioning, 3.5)
    negative_conditioning = CLIPTextEncode('', clip)

    latent = EmptySD3LatentImage(1024, 1024, 1)
    # Note that Flux dev and schnell do not have any negative prompt so CFG should be set to 1.0. Setting CFG to 1.0 means the negative prompt is ignored.
    latent = KSampler(model, 972054013131368, 20, 1, 'euler', 'simple', positive_conditioning, negative_conditioning, latent, 1)
    image = VAEDecode(latent, vae)
    SaveImage(image, 'ComfyUI')