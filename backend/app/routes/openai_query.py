from dotenv import load_dotenv
import os
import requests

# Load environment variables from .env
load_dotenv()

def get_openai_response(query):
  # Set your OpenAI API key
  OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
  OPENAI_ENDPOINT = os.getenv("OPENAI_ENDPOINT")

  headers = {
    'Authorization': f'Bearer {OPENAI_API_KEY}',
    'Content-Type': 'application/json'
  }

  payload = {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
            "role": "user",
            "content": query
        }
    ]
  }

  response = requests.post(OPENAI_ENDPOINT, headers=headers, json=payload)

  if response.status_code == 200:
    ans = response.json()['choices'][0]['message']['content']
    #ans = ans[2:]
    return ans
  else:
    return response

# Gets the line number from user input
def line_number(user_input):
  prompt = f"return the line number specified in this comment: {user_input} Return the number and the number alone, without anything else"
  return(int(get_openai_response(prompt)))

# Parses code for the line object
def parse_with_line_number(code, file_number, line_number):
  file = code.files[file_number]
  for line in file.lines:
    if line.line_number == line_number:
      return line
  return None

# Determines if the user makes a correct suggestion
def determine_correctness(parsed_line, user_input):
  if parsed_line.is_modified == False:
     print("going through 1")
     return "false"
  if parsed_line.is_correct == True:
     print("going through 2")
     return "false"
  prompt = f'''
This is an object that contains line of code the user wants to modify.
{parsed_line}
id 1 is the original code, we ignore it
id 2 is the modified code that the user is commenting on to modify
id 3 is the correct code.
Based on the user's comment, check if their explanation matches id 3.
return true or false
user: {user_input}'''
  return(get_openai_response(prompt))

# Gets a coworker's response
def coworker_response(correct):
    if correct:
        prompt = "You are the coworker of a user who is doing a code review on your code,  the user had an insightful comment on the code. Reply saying that their review was insightful and you will implement it. Make it concise"
    else:
        prompt = "You are the coworker of a user who is doing a code review on your code,  the user had an incorrect/invalud comment on the code. Reply saying that their comment seems incorrect but be appreciative. Make it concise"

    return get_openai_response(prompt)

# Makes the modification to the code
def code_modification(code, file_number, line_number, correct):
    if correct:
        file = code.files[file_number]
        for line in file.lines:
            if line.line_number == line_number:
                line.is_correct = True
        code.mistakes_found += 1
        return code
    else:
        return code 

   