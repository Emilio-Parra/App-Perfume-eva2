import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NosotrosPage } from '../components/NosotrosPage';

describe('components/NosotrosPage', () => {
  afterEach(cleanup);

  it('muestra historia, misión, visión y los tres valores', () => {
    render(<NosotrosPage onIrACatalogo={() => {}} />);
    ['Nuestra historia', 'Misión', 'Visión', 'Autenticidad', 'Asesoría cercana', 'Envíos a todo Chile'].forEach((t) =>
      expect(screen.getByText(t)).toBeTruthy()
    );
  });

  it('el botón del catálogo llama a onIrACatalogo', () => {
    const onIrACatalogo = jasmine.createSpy('onIrACatalogo');
    render(<NosotrosPage onIrACatalogo={onIrACatalogo} />);
    fireEvent.click(screen.getByRole('button', { name: /conoce nuestro catálogo/i }));
    expect(onIrACatalogo).toHaveBeenCalled();
  });
});
