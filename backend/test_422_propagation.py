import requests

def test_422_propagation():
    url = "http://127.0.0.1:8000/api/analyze"
    # Create a dummy file that is NOT a real video to trigger "No frames extracted"
    with open("dummy_test.txt", "w") as f:
        f.write("this is not a video")
    
    files = {'video': ('dummy_test.txt', open('dummy_test.txt', 'rb'), 'video/mp4')}
    
    try:
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 422:
            print("✔ SUCCESS: Backend correctly returned 422 for bad video payload.")
        else:
            print("✘ FAILURE: Backend did not return 422.")
    except Exception as e:
        print(f"Error during request: {e}")

if __name__ == "__main__":
    test_422_propagation()
