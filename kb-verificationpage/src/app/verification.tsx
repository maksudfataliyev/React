"use client";

import styles from './page.module.css';
import { useState, useEffect } from "react";

export default function HomePage() {
   const [timeLeft, setTimeLeft] = useState(59); 

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 59)); 
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  return (
    <div className={styles.container}>
      <div className={styles.logo}>birbank</div>

      <div className={styles.content}>
        <h1 className={styles.title}>Verify your phone number</h1>
        <p className={styles.subtitle}>
          Enter the code that was sent to your number
        </p>

        <div className={styles.codeInput}>
        <label className={styles.label}>6-digit code</label>
        <input
            type="tel"
            className={styles.input}
            maxLength={6}
            pattern="[0-9]*"
            placeholder=""
        />
        </div>


        <p className={styles.link}>
                <p>Resend code: <span className={styles.timer}>{minutes}:{seconds}</span></p>
        </p>

        <button className={styles.button}>Continue</button>

        <p className={styles.terms}>
          By continuing, I agree to the <span>Terms and Conditions</span> of Birbank and to the <span>Terms and Conditions</span> of Bir ID.
        </p>
      </div>
    </div>
  );
}