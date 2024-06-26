import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Codereview.css';
import logoPath from './Vector.png';

const Codereview = () => {
  const location = useLocation();
  const initialCodeState = location.state ? location.state.code : null;
  const [code, setCode] = useState(initialCodeState);
  const [readme, setReadme] = useState(false)

  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hey, please review my code before we merge it!' },
  ]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (location.state && location.state.code) {
      setCode(location.state.code);
    }
  }, [location.state]);

  const handleSendMessage = async() => {
    if (inputValue.trim()) {
      const userInputMessage = { sender: 'user', text: inputValue };
      const newMessages = [...messages, userInputMessage];

      // Make post request with the last message and the code
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/UserInteraction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 'code':code, 'user_input':inputValue }),
        });
        if (response.ok) {
          const data = await response.json();
          const { response: newMessage, code: newCode } = data;

          newMessages.push({ sender: 'bot', text: newMessage });
          setMessages(newMessages);
           
          setCode(newCode);
        } else {
          console.error('request');
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }

      setInputValue('');
    }
  };

  const navigate = useNavigate();
  const handleProblemsClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container">
      <header className="header">
        <div className="left-container">
          <img src={logoPath} alt="Logo" className="logo-image" />
          <div className="logo">Critqly</div>
        </div>
        <button className="problems-button" onClick={handleProblemsClick}>Problems</button>
      </header>
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Files</h2>
        <div className="file-list">
          <div className="file-item" onClick={() => setReadme(false)}>review.py</div>
          <div className="file-item" onClick={() => setReadme(true)}>README.md</div>
        </div>
      </div>
      
      {/* Code Review Section */}
      <div className="code-review">
        <h2>Code Review</h2>
        {readme? (<code>{code.readme}</code>):
        (<div>
          {code && code.lines.map((line, index) => {
            let codes = [];
            if (line.is_modified) {
              if (line.is_correct) {
                codes.push(line.versions.find(version => version.id === 1).code);
                codes.push(line.versions.find(version => version.id === 3).code);
              } else {
                codes.push(line.versions.find(version => version.id === 1).code);
                codes.push(line.versions.find(version => version.id === 2).code);
              }
            } else {
              codes.push(line.versions[0].code);
            }

            return (
              <div key={index}>
                {codes.map((code, cIndex) => (
                  <div key={cIndex} className={codes.length > 1 && cIndex === 0 ? 'highlight_red' : (codes.length > 1 && cIndex === 1 ? 'highlight_green' : '')}>
                    <code>{line.line_number} {code}</code>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        )}
      </div>
      
      {/* Chatbot Section */}
      <div className="chatbot">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 style={{ marginRight: "100px" }}>Chatbot</h2>
          <h2 style={{ marginLeft: "70px" }}>{code.mistakes_found}/{code.number_of_mistakes}</h2>
        </div>
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            className='rando'
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
          />
          <button className="chatbutton" onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Codereview;
