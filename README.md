# NODEJS API SOLID - gympass style app

## Requisitos Funcionais

- [x] Dever ser possível se cadastrar;
- [x] Dever ser possível se autenticar;
- [x] Dever ser possível obter o perfil de um usuário logado;
- [x] Dever ser possível obter o número de check-ins realizados pelo usuário logado;
- [x] Dever ser possível o usuário obter seu histórico de check-ins;
- [x] Dever ser possível o usuário buscar academias próximas (até 10 Km);
- [x] Dever ser possível o usuário buscar academias pelo nome;
- [x] Dever ser possível o usuário realizar check-in em uma academia;
- [x] Dever ser possível validar o check-in de um usuário;
- [x] Dever ser possível cadastrar uma academia;

## Regras de negócio

- [x] O usuário não deve poder se cadastrar com um e-mail duplicado;
- [x] O usuário não pode fazer 2 check-ins no mesmo dia;
- [x] O usuário não pode fazer check-in se não tiver perto (100m) da academia;
- [x] O check-in só pode ser validado até 20 minutos após criado;
- [x] O check-in só pode ser validado por administradores;
- [x] A academia só pode ser cadastrada por administradores;

## Requisitos não funcionais

- [x] A senha do usuário precisa estar criptografada;
- [x] Os dados da aplicação precisam estar persistidos em um banco PostgreSQL;
- [x] Todas listas de dados precisam estar paginadas com 20 itens por páginas;
- [x] O usuário deve ser identificado por um JWT (JSON Web Token)