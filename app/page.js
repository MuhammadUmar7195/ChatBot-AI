"use client";

import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export default function Home() {
  const [message, setMessage] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState(null);

  const apiKey = "AIzaSyARB8iudXzzVsfAyHpEjaEi9f1kYXlBgtI";
  const Model_Name = "gemini-1.5-flash";

  const generativeAi = new GoogleGenerativeAI(apiKey);

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  useEffect(() => {
    const initChat = async () => {
      try {
        const model = await generativeAi.getGenerativeModel({ model: Model_Name });
        const newChat = await model.startChat({
          generationConfig,
          safetySettings,
          history: message.map((msg) => ({
            text: msg.text,
            role: msg.role,
          })),
        });
        setChat(newChat);
      } catch (error) {
        setError("Something is getting wrong. Please wait a moment....");
      }
    };

    initChat();
  }, [message]);

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: 'user',
        timestamp: new Date(),
      };

      setMessage((previousMessage) => [...previousMessage, userMessage]);
      setUserInput("");

      if (chat) {
        const result = await chat.sendMessage(userInput);
        const botMessage = {
          text: result.response.text(),
          role: "bot",
          timestamp: new Date(),
        }

        setMessage((previousMessage) => [...previousMessage, botMessage]);
      }
    } catch (error) {
      setError("Failed to send the message. Try again later.");
    }
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const getThemeColor = () => {
    switch (theme) {
      case "light":
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-gray-800",
        };
      case "dark":
        return {
          primary: "bg-gray-900",
          secondary: "bg-gray-800",
          accent: "bg-yellow-500",
          text: "text-gray-100",
        };
      default:
        return {
          primary: "bg-white",
          secondary: "bg-gray-800",
          accent: "bg-blue-500",
          text: "text-gray-800",
        };
    }
  };

  const handleKeyPass = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const { primary, secondary, accent, text } = getThemeColor();

  return (
    <>
      <div className={`flex flex-col h-screen p-3 ${primary}`}>
        <div className="flex justify-between items-center mb-4 ">
          <h1 className={`text-4xl font-semibold ${text} `}>CHATBOT</h1>
          <div>
            <label htmlFor="theme" className={`text-sm ${text}`}>Theme: </label>
            <select id="theme" value={theme} onChange={handleThemeChange} className={`p-1 rounded-md border-none`}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        <div className={`flex-1 overflow-y-auto ${secondary} p-4 rounded-lg`}>
          {message.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-block p-3 rounded-lg ${msg.role === "user" ? `${accent} text-white` : `${primary} ${text}`}`}>
                {msg.text}
              </div>
              <p className={`text-xs ${text} mt-1`}>
                {msg.role === "bot" ? "Bot" : "You"} {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <div className="flex items-center border-gray-100">
          <input
            type="text"
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyPass}
            className={`flex-1 p-4 rounded-l-md border shadow-sm focus:outline-none`}
          />
          <button
            onClick={handleSendMessage}
            className={`p-4 ${accent} text-white rounded-r-md hover:bg-opacity-80 focus:outline-none`}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
