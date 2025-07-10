<?php

namespace App\Filters\Person;

class FirstNameFilter
{
    function __invoke($query, $request)
    {
        return $query->where('first_name', 'LIKE', $request . '%');
    }
}
