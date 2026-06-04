import "../app/globals.css";

export default { title: "Components/Input" };

const peerInput = "peer pt-8.5 pb-3.5 placeholder-transparent"
const peerLabel = `absolute left-3 top-9 text-(--divider) transition-all duration-300 pointer-events-none
                   peer-focus:top-2 peer-focus:text-xs peer-focus:text-(--gray)
                   peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-(--gray)`
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
