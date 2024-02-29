def sample_from_collection(collection):
    import random
    return random.choice(collection)

def test_sample():
    collection = [1, 2, 3, 4, 5]
    assert sample_from_collection(collection) in collection
