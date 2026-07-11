const Map = () => {
    return (
      <div className="map-container">
        <iframe
          src="https://www.google.com/maps?q=Mellos%20Trucks&output=embed"
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación Mellos Trucks"
        ></iframe>
      </div>
    );
  };
  
  export default Map;