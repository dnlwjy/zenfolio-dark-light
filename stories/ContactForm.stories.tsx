import "../app/globals.css";
import ContactForm from "../components/ContactForm";

export default { title: "Components/ContactForm" };

export const Default = {
  render: () => (
    <div className="w-full max-w-xl p-8">
      <ContactForm />
    </div>
  ),
};
