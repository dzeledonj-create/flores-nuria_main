<?php

class ClienteController extends Controller
{
    public function listar(): array
    {
        return $this->ok(Cliente::getClientes());
    }
}
