import styles from './Login.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>birbank</div>

      <div className={styles.content}>
        <h1 className={styles.title}>Log in to BirProfile</h1>
        <p className={styles.subtitle}>
          To get started, enter your mobile number
        </p>

        <div className={styles.inputGroup}>
            <span className={styles.countryCode} >+994</span>
          <input
            type="tel"
            className={styles.input}
          />
        </div>

        <p className={styles.link}>
          What is Bir ID and how it works?
        </p>

        <button className={styles.button}>Continue with Bir ID</button>

        <p className={styles.terms}>
          By continuing, I agree to the <span>Terms and Conditions</span> of Birbank and to the <span>Terms and Conditions</span> of Bir ID.
        </p>
      </div>
    </div>
  );
}
