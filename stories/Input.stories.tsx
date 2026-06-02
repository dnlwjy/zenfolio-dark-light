import "../app/globals.css";
import { peerInput, peerLabel } from "../components/ContactForm";

export default { title: "Components/Input" };

const SUPPORT = "relative w-full max-w-150 flex flex-col gap-8"

export const SingleInput = {
  render: () => (
    <div className={SUPPORT}>
      <input
        id="contact-name"
        type="text"
        name="name"
        placeholder=""
        required
        autoFocus
        aria-label="Full Name"
        aria-required="true"
        autoComplete="name"
        className={peerInput}
      />
      <label
        htmlFor="contact-name"
        className={peerLabel}
      >
        Full Name
      </label>
    </div>
  )
}

export const AreaInput = {
  render: () => (
    <div className={SUPPORT}>
      <textarea
        id="contact-message"
        name="message"
        placeholder=" "
        required
        rows={5}
        aria-label="Your message"
        aria-required="true"
        autoComplete="off"
        className={peerInput}
      />
      <label
        htmlFor="contact-message"
        className={peerLabel}
      >
        Your Message
      </label>
    </div>
  ),
};
