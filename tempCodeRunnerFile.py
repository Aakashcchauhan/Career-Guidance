import speech_recognition as sr
import pyttsx3
import requests
import json
import re
import time

# ----------------- CONFIG --------------------
API_KEY = ""  # Replace with your actual Gemini API key
DIFFICULTY_TIMES = {
    "basic": 60,
    "intermediate": 120,
    "advanced": 180
}
INTRO_TIME = 60  # 1 minute for introduction
TOTAL_QUESTIONS = 3
# ---------------------------------------------

def speak(text, engine):
    engine.say(text)
    engine.runAndWait()

def listen(recognizer, mic, timeout=None):
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=1)
        print("🎤 Listening...")
        if timeout:
            print(f"You have {timeout} seconds to speak...")
            audio = recognizer.listen(source, timeout=timeout)
        else:
            audio = recognizer.listen(source)
    try:
        return recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        return ""
    except sr.RequestError as e:
        print(f"Speech recognition error: {e}")
        return ""

def clean_text(text):
    text = text.replace('* ', '')
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    return text.strip()

def ask_gemini(prompt):
    try:
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key={API_KEY}",
            headers={"Content-Type": "application/json"},
            data=json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"maxOutputTokens": 500}
            })
        )
        
        # Check if the request was successful
        response.raise_for_status()
        
        # Parse the JSON response
        data = response.json()
        
        # Print full response for debugging
        print("API Response:", json.dumps(data, indent=2))
        
        # Check if the response has the expected structure
        if 'candidates' in data and len(data['candidates']) > 0 and 'content' in data['candidates'][0]:
            return data
        else:
            print("❗ Unexpected API response format:", data)
            return None
    except requests.exceptions.RequestException as e:
        print(f"❗ API request error: {e}")
        return None
    except json.JSONDecodeError:
        print("❗ Failed to parse API response as JSON")
        return None
    except Exception as e:
        print(f"❗ Unexpected error when calling API: {e}")
        return None

def record_timed_introduction(recognizer, mic, engine, duration=INTRO_TIME):
    speak(f"Please introduce yourself. You have {duration} seconds.", engine)
    print(f"⏱️ Recording introduction for {duration} seconds...")
    
    intro_text = ""
    
    # Record until time is up
    try:
        with mic as source:
            recognizer.adjust_for_ambient_noise(source, duration=1)
            audio = recognizer.record(source, duration=duration)
        
        intro_text = recognizer.recognize_google(audio)
        print(f"📝 Introduction recorded: {intro_text}")
    except sr.UnknownValueError:
        print("❗ Could not understand the introduction")
        intro_text = "No clear introduction detected"
    except sr.RequestError as e:
        print(f"❗ Speech recognition error: {e}")
        intro_text = "Error recording introduction"
    except Exception as e:
        print(f"❗ Unexpected error during introduction recording: {e}")
        intro_text = "Error during introduction"
        
    return intro_text

def generate_question(user_intro, index, previous_qa=None, difficulty="basic"):
    base_prompt = f"""
    You are an AI interviewer conducting a technical interview.

    Candidate introduction: "{user_intro}"
    Question number: {index + 1} out of {TOTAL_QUESTIONS}
    Difficulty: {difficulty}

    {f'Previous Q&A:\nQ: {previous_qa["question"]}\nA: {previous_qa["answer"]}\nScore: {previous_qa["score"]}/10\nUse this context to improve difficulty.' if previous_qa else ''}

    Ask a single clear and technical or behavioral interview question based on their introduction. Do not include answers or explanations.
    """
    
    response = ask_gemini(base_prompt)
    
    # Handle potential errors in the API response
    if response and 'candidates' in response and len(response['candidates']) > 0:
        try:
            candidate = response['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content'] and len(candidate['content']['parts']) > 0:
                part = candidate['content']['parts'][0]
                if 'text' in part:
                    return clean_text(part['text'])
        except (KeyError, IndexError) as e:
            print(f"❗ Error extracting text from response: {e}")
    
    # Fallback questions if there was an issue with the API
    fallback_questions = [
        "Tell me about your relevant skills and experience.",
        "What technical challenges have you faced in your previous work?",
        "Describe a project you're particularly proud of and why.",
        "How do you approach problem-solving?",
        "What are your strengths and weaknesses?",
        "Where do you see yourself in five years?"
    ]
    
    # Use a different fallback question for each interview question
    fallback_index = index % len(fallback_questions)
    print("❗ Using fallback question due to API response error")
    return fallback_questions[fallback_index]

def evaluate_answer(question, answer):
    prompt = f"""
    Evaluate the following answer to an interview question:

    Question: {question}
    Answer: {answer}

    Provide a JSON response like:
    {{
        "score": 7,
        "feedback": "Good structure but missed key concepts.",
        "correct_answer": "Ideal explanation of the concept should include ..."
    }}
    """
    
    response = ask_gemini(prompt)
    
    # Handle potential errors in the API response
    if response and 'candidates' in response and len(response['candidates']) > 0:
        try:
            text = response['candidates'][0]['content']['parts'][0]['text']
            # Try to parse the JSON response
            try:
                eval_result = json.loads(text)
                return eval_result
            except json.JSONDecodeError:
                print("❗ Failed to parse evaluation response as JSON")
                print("Raw response:", text)
                
                # Try to extract score, feedback, and correct_answer using regex
                score_match = re.search(r'"score":\s*(\d+)', text)
                feedback_match = re.search(r'"feedback":\s*"([^"]+)"', text)
                correct_match = re.search(r'"correct_answer":\s*"([^"]+)"', text)
                
                score = int(score_match.group(1)) if score_match else 5
                feedback = feedback_match.group(1) if feedback_match else "No specific feedback available."
                correct = correct_match.group(1) if correct_match else "No correct answer available."
                
                return {
                    "score": score,
                    "feedback": feedback,
                    "correct_answer": correct
                }
        except (KeyError, IndexError, AttributeError) as e:
            print(f"❗ Error extracting or parsing evaluation: {e}")
    
    # Fallback evaluation
    return {
        "score": 5,
        "feedback": "Unable to evaluate response due to technical issues.",
        "correct_answer": "Please review your answer with a professional in this field."
    }

def run_interview():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    engine = pyttsx3.init()

    print("🤖 AI Interviewer Starting...\n")
    speak("Welcome to your AI interview. Let's begin.", engine)
    
    # Record introduction for 1 minute
    user_intro = record_timed_introduction(recognizer, mic, engine)
    
    # Check if introduction was recorded properly
    if not user_intro or user_intro in ["No clear introduction detected", "Error recording introduction", "Error during introduction"]:
        speak("I couldn't hear your introduction clearly. Let's try once more.", engine)
        user_intro = record_timed_introduction(recognizer, mic, engine)
        
        # If still no valid introduction, use a generic one
        if not user_intro or user_intro in ["No clear introduction detected", "Error recording introduction", "Error during introduction"]:
            user_intro = "Candidate seeking a technical position"
            speak("I'll proceed with a general interview.", engine)

    total_score = 0
    evaluations = []
    previous_qa = None
    difficulty_levels = ["basic", "intermediate", "advanced"]

    for i in range(TOTAL_QUESTIONS):
        try:
            level_index = min(i // 3, 2)  # Q1-3: basic, Q4-6: intermediate, Q7-10: advanced
            difficulty = difficulty_levels[level_index]

            question = generate_question(user_intro, i, previous_qa, difficulty)
            print(f"\n❓ Q{i+1}: {question}")
            speak(f"Question {i+1}: {question}", engine)

            speak(f"You have {DIFFICULTY_TIMES[difficulty] // 60} minutes to answer.", engine)
            start_time = time.time()
            answer = ""

            while time.time() - start_time < DIFFICULTY_TIMES[difficulty]:
                response = listen(recognizer, mic)
                if response:
                    answer = response
                    break

            if not answer:
                answer = "(No answer given)"
                speak("Time's up or no answer was detected.", engine)

            print(f"🗣️ Your Answer: {answer}")
            
            # Evaluate answer with error handling
            try:
                eval_result = evaluate_answer(question, answer)
                score = int(eval_result.get("score", 0))
                if score < 0 or score > 10:
                    score = max(0, min(10, score))  # Ensure score is between 0-10
            except Exception as e:
                print(f"❗ Error during evaluation: {e}")
                eval_result = {
                    "score": 5,
                    "feedback": "Evaluation error occurred.",
                    "correct_answer": "Unable to provide ideal answer due to technical issues."
                }
                score = 5
                
            total_score += score

            evaluations.append({
                "question": question,
                "answer": answer,
                "score": score,
                "feedback": eval_result.get("feedback", ""),
                "correct_answer": eval_result.get("correct_answer", "")
            })

            speak(f"You scored {score} out of 10 for this question.", engine)
            previous_qa = {
                "question": question,
                "answer": answer,
                "score": score
            }
            time.sleep(1)
            
        except Exception as e:
            print(f"❗ Error during question {i+1}: {e}")
            speak("There was an issue with this question. Let's move on.", engine)
            continue

    # Final Summary
    print("\n🎓 Final Evaluation:")
    speak("The interview is over. Here's your result summary.", engine)

    for i, eval in enumerate(evaluations):
        print(f"\nQ{i+1}: {eval['question']}")
        print(f"Your Answer: {eval['answer']}")
        print(f"Score: {eval['score']}/10")
        print(f"Feedback: {eval['feedback']}")
        print(f"Ideal Answer: {eval['correct_answer']}")

    print(f"\n🧠 Total Score: {total_score}/{len(evaluations) * 10}")
    speak(f"Your total score is {total_score} out of {len(evaluations) * 10}. Thank you.", engine)

if __name__ == "__main__":
    try:
        run_interview()
    except Exception as e:
        print(f"❗ Fatal error: {e}")
        print("The AI Interviewer has stopped unexpectedly.")
        # Try to initialize speech engine for final message
        try:
            engine = pyttsx3.init()
            engine.say("An error occurred. The interview has been terminated.")
            engine.runAndWait()
        except:
            pass
