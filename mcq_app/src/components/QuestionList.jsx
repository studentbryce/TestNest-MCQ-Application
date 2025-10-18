import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import '../App.css';

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    Question: '',
    Choice1: '',
    Choice2: '',
    Choice3: '',
    Choice4: '',
    Answer: 1, // Store as integer (1-4)
  });

  // Helper function to convert integer answer (1-4) to choice text for display
  const getAnswerText = (question) => {
    switch(question.answer) {
      case 1: return question.choice1;
      case 2: return question.choice2;
      case 3: return question.choice3;
      case 4: return question.choice4;
      default: return question.choice1;
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase.from('questions').select('*');
      if (error) {
        console.error('Error fetching questions:', error);
      } else {
        setQuestions(data || []);
      }
    } catch (error) {
      console.error('Error in fetchQuestions:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert Answer field to integer
    if (name === 'Answer') {
      setNewQuestion({ ...newQuestion, [name]: parseInt(value) });
    } else {
      setNewQuestion({ ...newQuestion, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newQuestion.Question.trim() || 
        !newQuestion.Choice1.trim() || 
        !newQuestion.Choice2.trim()) {
      alert('Please fill in the question and at least two choices.');
      return;
    }

    try {
      const { error } = await supabase.from('questions').insert([{
        question: newQuestion.Question,
        choice1: newQuestion.Choice1,
        choice2: newQuestion.Choice2,
        choice3: newQuestion.Choice3 || null,
        choice4: newQuestion.Choice4 || null,
        answer: newQuestion.Answer // Store as integer (1-4)
      }]);

      if (error) {
        console.error('Error creating question:', error);
        alert('Error creating question. Please try again.');
      } else {
        // Reset form
        setNewQuestion({
          Question: '',
          Choice1: '',
          Choice2: '',
          Choice3: '',
          Choice4: '',
          Answer: 1,
        });
        
        // Refresh questions list
        fetchQuestions();
        alert('Question added successfully!');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Error creating question. Please try again.');
    }
  };

  return (
    <div className="card">
      <h2 className="header">📝 Question Management</h2>
      
      {/* Add New Question Form */}
      <div className="form-section">
        <h3>➕ Add New Question</h3>
        <form className="question-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="Question">Question:</label>
            <textarea
              id="Question"
              name="Question"
              value={newQuestion.Question}
              onChange={handleChange}
              placeholder="Enter your question..."
              required
              rows="3"
            />
          </div>

          <div className="choices-grid">
            <div className="form-group">
              <label htmlFor="Choice1">Choice 1 (Required):</label>
              <input
                type="text"
                id="Choice1"
                name="Choice1"
                value={newQuestion.Choice1}
                onChange={handleChange}
                placeholder="First choice..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="Choice2">Choice 2 (Required):</label>
              <input
                type="text"
                id="Choice2"
                name="Choice2"
                value={newQuestion.Choice2}
                onChange={handleChange}
                placeholder="Second choice..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="Choice3">Choice 3 (Optional):</label>
              <input
                type="text"
                id="Choice3"
                name="Choice3"
                value={newQuestion.Choice3}
                onChange={handleChange}
                placeholder="Third choice..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="Choice4">Choice 4 (Optional):</label>
              <input
                type="text"
                id="Choice4"
                name="Choice4"
                value={newQuestion.Choice4}
                onChange={handleChange}
                placeholder="Fourth choice..."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="Answer">Correct Answer:</label>
            <select
              id="Answer"
              name="Answer"
              value={newQuestion.Answer}
              onChange={handleChange}
              required
            >
              <option value={1}>Choice 1: {newQuestion.Choice1 || 'Enter Choice 1 first'}</option>
              <option value={2}>Choice 2: {newQuestion.Choice2 || 'Enter Choice 2 first'}</option>
              {newQuestion.Choice3 && <option value={3}>Choice 3: {newQuestion.Choice3}</option>}
              {newQuestion.Choice4 && <option value={4}>Choice 4: {newQuestion.Choice4}</option>}
            </select>
          </div>

          <button type="submit" className="home-nav-btn primary question-form-submit">
            ➕ Save Question
          </button>
        </form>
      </div>

      {/* Questions List */}
      <div className="questions-section">
        <h3>📋 Existing Questions ({questions.length})</h3>
        
        {questions.length > 0 ? (
          <div className="questions-list">
            {questions.map((q, index) => {
              const correctAnswerText = getAnswerText(q);
              
              return (
                <div key={q.questionid} className="question-item">
                  <div className="question-number">
                    <span className="number-badge">Q{index + 1}</span>
                    <span className="question-id">ID: {q.questionid}</span>
                  </div>
                  
                  <div className="question-details">
                    <div className="question-text">
                      {q.question}
                    </div>
                    
                    <div className="choices-list">
                      <div className={`choice-row ${q.answer === 1 ? 'correct-answer' : ''}`}>
                        <span className="choice-letter">A.</span>
                        <span className="choice-text">{q.choice1}</span>
                        {q.answer === 1 && <span className="correct-badge">✅ Correct</span>}
                      </div>
                      
                      <div className={`choice-row ${q.answer === 2 ? 'correct-answer' : ''}`}>
                        <span className="choice-letter">B.</span>
                        <span className="choice-text">{q.choice2}</span>
                        {q.answer === 2 && <span className="correct-badge">✅ Correct</span>}
                      </div>
                      
                      {q.choice3 && (
                        <div className={`choice-row ${q.answer === 3 ? 'correct-answer' : ''}`}>
                          <span className="choice-letter">C.</span>
                          <span className="choice-text">{q.choice3}</span>
                          {q.answer === 3 && <span className="correct-badge">✅ Correct</span>}
                        </div>
                      )}
                      
                      {q.choice4 && (
                        <div className={`choice-row ${q.answer === 4 ? 'correct-answer' : ''}`}>
                          <span className="choice-letter">D.</span>
                          <span className="choice-text">{q.choice4}</span>
                          {q.answer === 4 && <span className="correct-badge">✅ Correct</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>❓</div>
            <h3>No Questions Yet</h3>
            <p>Add your first question to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}