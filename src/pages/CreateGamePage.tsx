// src/pages/CreateGamePage.tsx
import React from 'react';
import CreateGameForm from '../components/FermiPoker/CreateGameForm';

const CreateGamePage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <CreateGameForm />
    </div>
  );
};

export default CreateGamePage;
