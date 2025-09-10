// COMPONENTE PARA MOSTRAR DETALLES DE UNA MARIPOSA ESPECÍFICA - USANDO SERVICIOS
// =====================================================

// Importamos React y los hooks necesarios
import React, { useEffect, useState } from 'react';
// Importamos useParams para obtener el ID desde la URL
import { useParams } from 'react-router-dom';
// Importamos la función que obtiene los datos de una mariposa específica y la actualiza
import { getOneButterfly, updateButterfly } from '../services/ButterflyServices';
// Importamos Swal para las alertas
import Swal from 'sweetalert2';
// Importamos los estilos CSS
import '../style/butterflydetail.css';
import ButtonCreateButterfly from '../components/ButtonCreateButterfly';

// Definimos el componente funcional ButterflyDetail
const ButterflyDetail = () => {
  // Obtenemos el ID de la mariposa desde los parámetros de la URL
  const { id } = useParams();
  
  // Creamos un estado para guardar los datos de UNA mariposa específica
  const [butterfly, setButterfly] = useState(null);
  
  // Estado para manejar los errores que puedan ocurrir
  const [error, setError] = useState(null);
  
  // Estado para mostrar un indicador de carga mientras se obtienen los datos
  const [loading, setLoading] = useState(true);

  // Estado para controlar el modo de edición
  const [isEditing, setIsEditing] = useState(false);

  // Estado para los datos del formulario de edición - AGREGADO "about conservation"
  const [editForm, setEditForm] = useState({
    name: '',
    family: '',
    location: '',
    habitat: '',
    morphology: '',
    life: '',
    feeding: '',
    conservation: '',
    about_conservation: '', // NUEVO CAMPO AGREGADO
    image: ''
  });

  // Estado para manejar la carga durante la actualización
  const [isUpdating, setIsUpdating] = useState(false);

  // Función para obtener el color del estado de conservación
  const getConservationColor = (status) => {
    if (!status) return '#f5e0a3';
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('lc') || lowerStatus.includes('preocupación menor')) {
      return '#4ade80'; // Verde
    } else if (lowerStatus.includes('nt') || lowerStatus.includes('casi amenazada')) {
      return '#fbbf24'; // Amarillo
    } else if (lowerStatus.includes('vu') || lowerStatus.includes('vulnerable')) {
      return '#f97316'; // Naranja
    } else if (lowerStatus.includes('en') || lowerStatus.includes('peligro')) {
      return '#ef4444'; // Rojo
    } else if (lowerStatus.includes('cr') || lowerStatus.includes('crítico')) {
      return '#dc2626'; // Rojo oscuro
    } else if (lowerStatus.includes('ex') || lowerStatus.includes('extinta')) {
      return '#6b7280'; // Gris
    }
    return '#f5e0a3'; // Color por defecto
  };

  // useEffect se ejecuta cuando el componente se monta O cuando cambia el ID
  useEffect(() => {
    // Función asíncrona para obtener los datos de la mariposa específica
    const fetchButterflyDetails = async () => {
      try {
        // Verificamos que tenemos un ID válido antes de hacer la petición
        if (!id) {
          console.log('Esperando a que el ID esté disponible...');
          return;
        }
        
        // Iniciamos la carga
        setLoading(true);
        
        // Llamamos al servicio que hace el fetch a la API para obtener UNA mariposa
        const data = await getOneButterfly(id);
        
        // Verificamos que recibimos datos válidos
        if (!data) {
          throw new Error('Mariposa no encontrada');
        }
        
        // Actualizamos el estado con los datos de la mariposa obtenida
        setButterfly(data);

        // Inicializamos el formulario de edición con los datos existentes - AGREGADO "about conservation"
        setEditForm({
          name: data.name || '',
          family: data.family || '',
          location: data.Location || '',
          habitat: data.Hábitat || '',
          morphology: data.Morphology || '',
          life: data.Life || '',
          feeding: data.Feeding || '',
          conservation: data.Conservation || '',
          about_conservation: data.about_conservation || '', // NUEVO CAMPO AGREGADO
          image: data.image || ''
        });
        
        // Limpiamos cualquier error previo
        setError(null);
        
      } catch (err) {
        // Si hay un error, lo guardamos en el estado
        console.error('Error al obtener los detalles de la mariposa:', err);
        
        // Mensaje de error más específico dependiendo del tipo de error
        if (err.message.includes('404') || err.message.includes('not found')) {
          setError('La mariposa solicitada no existe.');
        } else if (err.message.includes('ID de mariposa no proporcionado')) {
          setError('ID de mariposa no válido.');
        } else {
          setError('Error al cargar los detalles de la mariposa. Inténtalo de nuevo.');
        }
        
        // Limpiamos los datos de la mariposa en caso de error
        setButterfly(null);
        
      } finally {
        // Terminamos la carga sin importar si fue exitosa o no
        setLoading(false);
      }
    };

    // Ejecutamos la función para obtener los detalles
    fetchButterflyDetails();
    
  }, [id]);

  // Función para manejar los cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // Función para manejar la subida de imagen
  const handleImageUpload = () => {
    // Verificar que Cloudinary esté disponible
    if (!window.cloudinary) {
      alert('Error: Cloudinary no está disponible. Verifica que el script esté cargado.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget({
      cloudName: 'dggqy6jfb',
      uploadPreset: 'butterflies_preset',
      folder: 'butterflies',
      multiple: false,
      resourceType: 'image',
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      maxFileSize: 10000000, // 10MB
      sources: ['local', 'url', 'camera']
    }, (error, result) => {
      console.log('Cloudinary result:', result); // Para debug
      
      if (error) {
        console.error('Error en Cloudinary:', error);
        return;
      }
      
      if (result && result.event === "success") {
        console.log('Imagen subida exitosamente:', result.info.secure_url); // Para debug
        setEditForm(prev => ({
          ...prev,
          image: result.info.secure_url
        }));
      }
    });

    widget.open();
  };

  // Función para activar el modo de edición
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Función para cancelar la edición - ACTUALIZADA con "about conservation"
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Restauramos los datos originales
    setEditForm({
      name: butterfly.name || '',
      family: butterfly.family || '',
      location: butterfly.location || '',
      habitat: butterfly.habitat || '',
      morphology: butterfly.morphology || '',
      life: butterfly.life || '',
      feeding: butterfly.feeding || '',
      conservation: butterfly.conservation || '',
      about_conservation: butterfly.about_conservation || '', // RESTAURAR NUEVO CAMPO
      image: butterfly.image || ''
    });
  };

  // Función para guardar los cambios
  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      
      // Llamamos al servicio para actualizar la mariposa
      const updatedButterfly = await updateButterfly(id, editForm);
      
      if (updatedButterfly) {
        // Actualizamos el estado con los nuevos datos
        setButterfly(updatedButterfly);
        setIsEditing(false);
        
        // Mostrar mensaje de éxito con SweetAlert2
        Swal.fire({
          position: "center",
          title: "Mariposa actualizada correctamente",
          showConfirmButton: false,
          timer: 60000, // 1 minuto
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title'
          },
          background: 'rgba(29, 27, 63, 0.95)',
          color: '#f5e0a3'
        });
      }
      
    } catch (err) {
      console.error('Error al actualizar la mariposa:', err);
      Swal.fire({
        position: "top-end",
        title: "Error al actualizar la mariposa",
        text: "Inténtalo de nuevo",
        showConfirmButton: false,
        timer: 60000, // 1 minuto
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          htmlContainer: 'custom-swal-text'
        },
        background: 'rgba(29, 27, 63, 0.95)',
        color: '#f5e0a3'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Renderizado condicional: Si está cargando, mostramos un mensaje
  if (loading) {
    return (
      <section className="bg-gradient-to-t from-rosaatardecer to-indigoprofundo font-libre min-h-screen">
        <div className="butterfly-detail-container">
          <div className="loading-message">
            <p>Cargando detalles de la mariposa ID: {id}...</p>
          </div>
        </div>
      </section>
    );
  }

  // Si hay un error, lo mostramos con opción de volver atrás
  if (error) {
    return (
      <section className="bg-gradient-to-t from-rosaatardecer to-indigoprofundo font-libre min-h-screen">
        <div className="butterfly-detail-container">
          <div className="error-message">
            <p style={{ color: 'red' }}>{error}</p>
            <p>ID solicitado: {id}</p>
            <div>
              <button onClick={() => window.location.reload()} style={{ marginRight: '10px' }}>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Si no hay datos de mariposa (caso edge), mostramos mensaje
  if (!butterfly) {
    return (
      <section className="bg-gradient-to-t from-rosaatardecer to-indigoprofundo font-libre min-h-screen">
        <div className="butterfly-detail-container">
          <p>No se encontraron datos de la mariposa.</p>
        </div>
      </section>
    );
  }

  // Renderizado principal: mostramos los detalles de la mariposa
  return (
    <section className="bg-gradient-to-t from-rosaatardecer to-indigoprofundo font-libre min-h-screen">
      <div className="butterfly-detail-container">
        
        {/* Contenedor principal con los detalles de la mariposa */}
        <div className="butterfly-detail-card">
          
          {/* Modo de visualización normal */}
          {!isEditing ? (
            <>
              {/* Título principal con el nombre de la mariposa */}
              <h1 className="butterfly-title">{butterfly.name}</h1>
              
              {/* Familia en itálica como subtítulo */}
              <p className="butterfly-family">{butterfly.family}</p>
              
              {/* Contenedor de imagen centrada con indicador de conservación - ACTUALIZADO */}
              <div className="butterfly-image-container">
                <div className="butterfly-image-wrapper">
                  {/* Indicador de estado de conservación en esquina superior izquierda */}
                  <div 
                    className="conservation-badge"
                    style={{ 
                      backgroundColor: getConservationColor(butterfly['about conservation']),
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#000',
                      zIndex: 10,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {butterfly['about conservation'] || 'No especificado'}
                  </div>
                  
                  {butterfly.image ? (
                    <img 
                      src={butterfly.image} 
                      alt={butterfly.name}
                      className="butterfly-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="butterfly-image-placeholder">
                    🦋
                  </div>
                </div>
              </div>
              
              {/* Contenedor de información en dos columnas */}
              <div className="butterfly-info-columns">
                
                {/* Primera columna */}
                <div className="info-column">
                  
                  {/* Sección de Ubicación */}
                  <div className="info-section">
                    <h3 className="section-title">Ubicación</h3>
                    <p className="section-content">{butterfly.Location || 'Información no disponible'}</p>
                  </div>
                  
                  {/* Sección de Morfología */}
                  <div className="info-section">
                    <h3 className="section-title">Morfología</h3>
                    <p className="section-content">{butterfly.Morphology || 'Información no disponible'}</p>
                  </div>
                  
                  {/* Sección de Alimentación */}
                  <div className="info-section">
                    <h3 className="section-title">Alimentación</h3>
                    <p className="section-content">{butterfly.Feeding || 'Información no disponible'}</p>
                  </div>
                  
                </div>
                
                {/* Segunda columna */}
                <div className="info-column">
                  
                  {/* Sección de Hábitat */}
                  <div className="info-section">
                    <h3 className="section-title">Hábitat</h3>
                    <p className="section-content">{butterfly.Hábitat || 'Información no disponible'}</p>
                  </div>
                  
                  {/* Sección de Ciclo de Vida */}
                  <div className="info-section">
                    <h3 className="section-title">Ciclo de Vida</h3>
                    <p className="section-content">{butterfly.Life || 'Información no disponible'}</p>
                  </div>
                  
                  {/* Sección de Conservación */}
                  <div className="info-section">
                    <h3 className="section-title">Estado de Conservación</h3>
                    <p className="section-content">{butterfly.Conservation || 'Información no disponible'}</p>
                  </div>
                  
                </div>
                
              </div>

              {/* Botón para editar los datos */}
              <div className="edit-button-container">
                <button 
                  className="edit-button"
                  onClick={handleEditClick}
                >
                  Editar Mariposa
                </button>
              </div>
            </>
          ) : (
            /* Modo de edición */
            <div className="edit-mode">
              <h2 className="edit-title">Editando Mariposa</h2>
              
              <div className="edit-form">
                {/* Campos básicos */}
                <div className="form-group">
                  <label className="form-label">Nombre:</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nombre de la mariposa"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Familia:</label>
                  <input
                    type="text"
                    name="family"
                    value={editForm.family}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Familia de la mariposa"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Imagen:</label>
                  <div className="image-upload-section">
                    <input
                      type="url"
                      name="image"
                      value={editForm.image}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <div className="upload-divider">O</div>
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      className="upload-button"
                    >
                      📁 Subir imagen desde ordenador
                    </button>
                  </div>
                </div>

                {/* NUEVO: Campo de Estado de Conservación con selector dropdown */}
                <div className="form-group">
                  <label className="form-label">Estado de Conservación:</label>
                  <select
                    name="about conservation"
                    value={editForm['about conservation']}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Seleccionar estado...</option>
                    <option value="LC">LC - Preocupación menor</option>
                    <option value="NT">NT - Casi amenazada</option>
                    <option value="VU">VU - Vulnerable</option>
                    <option value="EN">EN - En peligro</option>
                    <option value="CR">CR - En peligro crítico</option>
                    <option value="EW">EW - Extinta en estado silvestre</option>
                    <option value="EX">EX - Extinta</option>
                  </select>
                </div>

                {/* Campos de descripción */}
                <div className="form-group">
                  <label className="form-label">Ubicación:</label>
                  <textarea
                    name="Location"
                    value={editForm.Location}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Ubicación geográfica de la mariposa"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hábitat:</label>
                  <textarea
                    name="Hábitat"
                    value={editForm.Hábitat}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Descripción del hábitat"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Morfología:</label>
                  <textarea
                    name="Morphology"
                    value={editForm.Morphology}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Descripción morfológica"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ciclo de Vida:</label>
                  <textarea
                    name="Life"
                    value={editForm.Life}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Descripción del ciclo de vida"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alimentación:</label>
                  <textarea
                    name="Feeding"
                    value={editForm.Feeding}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Información sobre alimentación"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Información Detallada de Conservación:</label>
                  <textarea
                    name="Conservation"
                    value={editForm.Conservation}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Información detallada sobre conservación"
                    rows="3"
                  />
                </div>

                {/* Botones de acción */}
                <div className="form-buttons">
                  <button 
                    className="save-button"
                    onClick={handleSaveChanges}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  
                  <button 
                    className="cancel-button"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <ButtonCreateButterfly/>
    </section>
  );
};

export default ButterflyDetail;

/*
// FETCH DIRECTO PARA MOSTRAR DETALLES DE UNA MARIPOSA ESPECÍFICA
// =====================================================

// Importamos React y los hooks necesarios
import React, { useEffect, useState } from 'react';
// Importamos useParams para obtener el ID desde la URL
import { useParams } from 'react-router-dom';

// Definimos el componente funcional ButterflyDetail
const ButterflyDetail = () => {
  // Obtenemos el ID de la mariposa desde los parámetros de la URL
  // Por ejemplo: si la ruta es /butterfly/123, id será "123"
  const { id } = useParams();
  
  // URL base de la API fake 
  // Esta URL debe coincidir con la de json-server
  const API_BASE_URL = 'http://localhost:3002/butterfly';
  
  // Creamos un estado para guardar los datos de UNA mariposa específica
  // Inicialmente es null porque esperamos a que el ID esté disponible en useEffect
  const [butterfly, setButterfly] = useState(null);
  
  // Estado para manejar los errores que puedan ocurrir
  const [error, setError] = useState(null);
  
  // Estado para mostrar un indicador de carga mientras se obtienen los datos
  const [loading, setLoading] = useState(true);

  // useEffect se ejecuta cuando el componente se monta O cuando cambia el ID
  // IMPORTANTE: El ID se pasa como dependencia para que el efecto espere a que esté disponible
  useEffect(() => {
    // Función asíncrona para obtener los datos de la mariposa específica usando fetch
    const fetchButterflyDetails = async () => {
      try {
        // Verificamos que tenemos un ID válido antes de hacer la petición
        // Esta verificación es crucial porque useEffect esperará a que ID esté disponible
        if (!id) {
          console.log('Esperando a que el ID esté disponible...');
          return; // Salimos de la función si no hay ID aún
        }
        
        // Iniciamos la carga
        setLoading(true);
        
        // Construimos la URL completa para obtener una mariposa específica
        // Por ejemplo: http://localhost:3002/butterfly/123
        const url = `${API_BASE_URL}/${id}`;
        
        // Hacemos la petición HTTP GET directamente a la API usando fetch
        // fetch() es la función nativa de JavaScript para hacer peticiones HTTP
        const response = await fetch(url);
        
        // Verificamos si la respuesta fue exitosa (status 200-299)
        if (!response.ok) {
          // Si el status es 404, significa que la mariposa no existe
          if (response.status === 404) {
            throw new Error('Mariposa no encontrada');
          }
          // Para otros errores HTTP, lanzamos un error con el status
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Convertimos la respuesta a formato JSON
        // response.json() devuelve una Promise, por eso usamos await
        const data = await response.json();
        
        // Verificamos que recibimos datos válidos (un objeto, no null o undefined)
        if (!data || typeof data !== 'object') {
          throw new Error('Datos de mariposa no válidos');
        }
        
        // Actualizamos el estado con los datos de la mariposa obtenida
        setButterfly(data);
        
        // Limpiamos cualquier error previo
        setError(null);
        
      } catch (err) {
        // Si hay un error, lo guardamos en el estado
        console.error('Error al obtener los detalles de la mariposa:', err);
        
        // Mensaje de error más específico dependiendo del tipo de error
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setError('Error de conexión. Verifica que json-server esté ejecutándose en http://localhost:3002');
        } else if (err.message.includes('404') || err.message.includes('no encontrada')) {
          setError('La mariposa solicitada no existe.');
        } else if (err.message.includes('ID de mariposa no proporcionado')) {
          setError('ID de mariposa no válido.');
        } else {
          setError(`Error al cargar los detalles de la mariposa: ${err.message}`);
        }
        
        // Limpiamos los datos de la mariposa en caso de error
        setButterfly(null);
        
      } finally {
        // Terminamos la carga sin importar si fue exitosa o no
        setLoading(false);
      }
    };

    // Ejecutamos la función para obtener los detalles
    fetchButterflyDetails();
    
  }, [id]); // CLAVE: El ID como dependencia hace que useEffect espere y se re-ejecute cuando ID cambie

  // Renderizado condicional: Si está cargando, mostramos un mensaje
  if (loading) {
    return (
      <div className="butterfly-detail-container">
        <div className="loading-message">
          <p>Cargando detalles de la mariposa desde {API_BASE_URL}/{id}...</p>          
          </div>
          </div>
        );
      }
    
      // Si hay un error, lo mostramos con información adicional y opción de volver atrás
      if (error) {
        return (
          <div className="butterfly-detail-container">
            <div className="error-message">
              <p style={{ color: 'red' }}>{error}</p>
              <p>URL intentada: {API_BASE_URL}/{id}</p>
              <div>
                <button onClick={() => window.location.reload()} style={{ marginRight: '10px' }}>
                  Reintentar
                </button>
                <button onClick={() => window.history.back()}>
                  Volver atrás
                </button>
              </div>
            </div>
          </div>
        );
      }
    
      // Si no hay datos de mariposa (caso edge), mostramos mensaje
      if (!butterfly) {
        return (
          <div className="butterfly-detail-container">
            <p>No se encontraron datos de la mariposa.</p>
            <button onClick={() => window.history.back()}>
              Volver atrás
            </button>
          </div>
        );
      }
    
      // Renderizado principal: mostramos los detalles de la mariposa
      return (
        <div className="butterfly-detail-container">          
          <button 
            className="back-button" 
            onClick={() => window.history.back()}
            style={{ marginBottom: '20px' }}
          >
            ← Volver
          </button>          
          
          <div className="butterfly-detail-card">
            
            <h1 className="butterfly-title">{butterfly.name}</h1>           
            
            <div className="basic-info">
              <h2>Información General</h2>
              <p><strong>ID:</strong> {butterfly.id}</p>
              <p><strong>Familia:</strong> {butterfly.family}</p>
            </div>            
            
            <div className="detailed-info">              
              
              <div className="info-section">
                <h3>📍 Ubicación</h3>
                <p>{butterfly.Location || 'Información no disponible'}</p>
              </div>              
              
              <div className="info-section">
                <h3>🏞️ Hábitat</h3>
                <p>{butterfly.Hábitat || 'Información no disponible'}</p>
              </div>              
              
              <div className="info-section">
                <h3>🔬 Morfología</h3>
                <p>{butterfly.Morphology || 'Información no disponible'}</p>
              </div>              
              
              <div className="info-section">
                <h3>🔄 Ciclo de Vida</h3>
                <p>{butterfly.Life || 'Información no disponible'}</p>
              </div>              
              
              <div className="info-section">
                <h3>🍃 Alimentación</h3>
                <p>{butterfly.Feeding || 'Información no disponible'}</p>
              </div>           
              
              <div className="info-section">
                <h3>🛡️ Estado de Conservación</h3>
                <p>{butterfly.Conservation || 'Información no disponible'}</p>
              </div>
              
            </div>
          </div>
        </div>
      );
    };
    
    export default ButterflyDetail;
*/

