<?php

class Persona
{
    protected $id;
    protected $nombre;
    protected $telefono;
    protected $correo;

    public function __construct($idEmpleado, $nombre, $telefono, $correo){
        $this->id = $idEmpleado;
        $this->nombre = $nombre;
        $this->telefono = $telefono;
        $this->correo = $correo;
    }


}