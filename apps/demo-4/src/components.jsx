export const Card = ({ props, children }) => (
  <div className="card">
    <div className="card-header">
      <h3 className="card-title">{props.title}</h3>
      {props.subtitle && <p className="card-subtitle">{props.subtitle}</p>}
    </div>
    {children && <div className="card-content">{children}</div>}
  </div>
);

export const Metric = ({ props }) => (
  <div className="metric">
    <div className="metric-value">{props.value}</div>
    <div className="metric-label">{props.label}</div>
    {props.trend && <div className="metric-trend">{props.trend}</div>}
  </div>
);

export const Button = ({ props }) => (
  <button className={`btn btn-${props.variant || 'primary'}`}>{props.label}</button>
);

export const Text = ({ props }) => (
  <p className={`text text-${props.size || 'base'}`}>{props.content}</p>
);

export const Stack = ({ props, children }) => (
  <div className={`stack stack-${props.direction || 'vertical'} stack-gap-${props.gap || 'md'}`}>
    {children}
  </div>
);

export const List = ({ props }) => (
  <ul className="list">
    {props.items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);
