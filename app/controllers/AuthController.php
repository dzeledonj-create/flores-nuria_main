<?php

/**
 * Inicio y cierre de sesión de empleados.
 */
class AuthController extends Controller
{
    public function login(): array
    {
        $this->exigirPost();
        $correo = trim($this->input('correo', ''));
        $password = $this->input('password', '');

        if (empty($correo) || empty($password)) {
            return $this->error('Por favor, rellene todos los campos.');
        }
        if (!Empleado::InicioSesion($correo, $password)) {
            return $this->error('Correo o contraseña incorrectos.');
        }
        return $this->ok($_SESSION['empleado'], 'Sesión iniciada.');
    }

    /**
     * Indica a la vista si hay sesión iniciada y quién es el empleado
     */
    public function session(): array
    {
        $autenticado = Empleado::checkSession();
        return $this->ok([
            'autenticado' => $autenticado,
            'empleado' => $autenticado ? $_SESSION['empleado'] : null,
        ]);
    }

    public function logout(): array
    {
        Empleado::logout();
        return $this->ok(null, 'Sesión cerrada.');
    }
}
