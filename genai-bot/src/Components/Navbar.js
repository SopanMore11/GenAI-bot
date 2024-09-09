import Link from "next/link";
import styles from "./Navbar.module.css"; // Import custom CSS

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>GenAI Bot</div>
            <div>
                <Link href="/login" className={styles.loginLink}>Login</Link>
            </div>
        </nav>
    );
}
