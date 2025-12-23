export const FormInput = ({ id, name, label, type, placeholder, required = false, value, onChange, disabled }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-v-text-secondary mb-2">
      {label}{required && <span className="text-v-accent">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full bg-v-glass-hover border border-white/20 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-v-accent text-v-text-primary placeholder-v-text-secondary/70"
    />
  </div>
);