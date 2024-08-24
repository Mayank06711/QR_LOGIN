import React, { useState } from "react";
const choices = ["Rock", "Paper", "Scissors"];

const getRandomChoice = () => {
  return choices[Math.floor(Math.random() * choices.length)];
};

const getResult = (playerChoice, computerChoice) => {
  if (playerChoice === computerChoice) {
    return "It's a tie!";
  }
  if (
    (playerChoice === "Rock" && computerChoice === "Scissors") ||
    (playerChoice === "Paper" && computerChoice === "Rock") ||
    (playerChoice === "Scissors" && computerChoice === "Paper")
  ) {
    return "You win!";
  }
  return "You lose!";
};

const Play = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState("");
  const handleClick = (choice) => {
    const computerChoice = getRandomChoice();
    setPlayerChoice(choice);
    setComputerChoice(computerChoice);
    setResult(getResult(choice, computerChoice));
  };

  return (
    <div style={styles.container}>
      <h1>Rock, Paper, Scissors</h1>
      <div style={styles.choices}>
        {choices.map((choice) => (
          <button key={choice} onClick={() => handleClick(choice)} style={styles.button}>
            {choice}
          </button>
        ))}
      </div>
      {playerChoice && computerChoice && (
        <div style={styles.result}>
          <p>Your choice: {playerChoice}</p>
          <p>Computer's choice: {computerChoice}</p>
          <h2>{result}</h2>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f0f0f0',
  },
  choices: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  result: {
    marginTop: '20px',
    textAlign: 'center',
  },
};

export default Play;
