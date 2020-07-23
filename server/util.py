def getNewImageDimensions(size, max_size=128):
    x, y = size
    if x <= max_size and y <= max_size:
        return x, y
    if x >= y:
        return max_size, max_size * y // x
    else:
        return max_size * x // y, max_size