import requests
import os

# Create a dummy PDF
with open("test.pdf", "wb") as f:
    f.write(b"%PDF-1.4 header dummy content")

url = "http://localhost:8000/api/v1/documents/upload"
files = {'file': ('test.pdf', open('test.pdf', 'rb'), 'application/pdf')}

# Try to upload without auth (might fail if I protected it, let's check endpoints)
# The endpoint has: current_user: UserModel = Depends(get_current_user)
# So we need a token.
# Since getting a token is complex, I will check if I can run this test easily. 
# Alternatively, I can temporarily disable auth for the test or just ask user to test.

# Given the complexity of auth, I will just create this file for the user to use if they want, 
# or I will modify the endpoint temporarily to allow testing? No, that's bad practice.
# I'll checking if I can use the "login" endpoint to get a token.

print("Test script created. Run this manually after logging in and getting a token, or rely on frontend.")
