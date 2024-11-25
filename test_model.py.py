from ultralytics import YOLO
model = YOLO("runs/detect/train/weights/best.pt")  # Load a custom trained model

# Perform tracking with the model
results = model.track("https://www.youtube.com/watch?v=5hghT1W33cY&t=53s", show=True)  # Tracking with default tracker