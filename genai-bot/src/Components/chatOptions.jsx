// components/ChatOptions.js

import Link from 'next/link';
import styles from './ChatOptions.module.css';

const ChatOptions = () => {
  return (
    <div className={styles.container}>
      {/* Card for Chat with PDF */}
      <div className={styles.card}>
        <h2>Chat with PDF</h2>
        <p>Upload a PDF and start an interactive chat about its content.</p>
        <Link href="/chat-with-pdf">
          <button className={styles.button}>Start Chat</button>
        </Link>
      </div>

      {/* Card for Chat with Link */}
      <div className={styles.card}>
        <h2>Chat with Link</h2>
        <p>Enter a link to a webpage and chat about its content.</p>
        <Link href="/chat-with-link">
          <button className={styles.button}>Start Chat</button>
        </Link>
      </div>
    </div>
  );
};

export default ChatOptions;
