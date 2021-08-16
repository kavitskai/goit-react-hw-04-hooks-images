import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchImages } from '../data/api';
import { Container } from './App.styled';
import { SearchBar } from '../components/Searchbar/Searchbar';
import { ImageGallery } from '../components/ImageGallery/ImageGallery';
import { Modal } from '../components/Modal/Modal';
import { Spinner } from '../components/Loader/Spinner';
import { LoadBtn } from '../components/Button/Button'

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!searchQuery) {
      return
    }

    async function getIamges() {
      setStatus("pending");
      try {
        const images = await fetchImages(searchQuery, page);

        if (!images.length) {
          throw new Error();
        }
        
        setImages(prevImages => [...prevImages, ...images]);
        setStatus("resolved");
        
        page > 1 &&
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
          });
        
      } catch (error) {
        toast.warning(`Not Found any images by query: ${searchQuery}`);
        setStatus("rejected");
      }
    }
    getIamges();
  }, [searchQuery, page]);

  const handleQueryChange = query => {
    if (query === searchQuery) {
      toast.info('Please, enter new query!');
      return;
    }
    resetState();
    setSearchQuery(query)
  };

  const resetState = () => {
    setSearchQuery("");
    setPage(1);
    setImages([]);
    setSelectedImage(null);
    setStatus("idle");
  };
  const toggleModal = () => {
   setSelectedImage(!selectedImage);
  };

  const incrementPage = () => {
    setPage( page => page + 1 );
  };

  const handleSelectedImage = imageURL => {
    setSelectedImage(imageURL);
  };

  if (status === "idle") {
      return (
        <Container>
          <SearchBar onSearch={handleQueryChange} />
        </Container>
      )
    }

    if (status === "pending") {
      return (
        <Container>
          <SearchBar onSearch={handleQueryChange} />
          <Spinner />
        </Container>
      )
   }

    if (status === "resolved") {
          return (
          <Container>
            <SearchBar onSearch={handleQueryChange} />
            <ImageGallery images={images} onImageSelect={handleSelectedImage}/>
            {images.length > 0 && <LoadBtn onClick={incrementPage} />}
            {selectedImage && (
              <Modal largeImageURL={selectedImage} onClose={toggleModal} />
            )}
            <ToastContainer />
          </Container>
        )}
      
    if (status === "rejected") {
        return (
          <Container>
            <SearchBar onSearch={handleQueryChange} />
            <ToastContainer />
          </Container>
        )}
}
