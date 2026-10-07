<?php

/**
 * Excepción con código HTTP asociado.
 * Los controladores la lanzan para cortar la petición y el Router la convierte en respuesta JSON.
 */
class HttpException extends Exception
{
    public function __construct(string $mensaje, int $status = 400)
    {
        parent::__construct($mensaje, $status);
    }
}
