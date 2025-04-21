import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ServiceCard = ({ service, onBook }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{service.name}</h5>
        <p className="card-text">{service.description}</p>
        <button className="btn btn-primary" onClick={() => onBook(service)}>Book Now</button>
      </div>
    </div>
  );
};

export default ServiceCard;
