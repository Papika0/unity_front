<?php

namespace App\Http\Resources\Auth;

use App\Models\Imei;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'user_name' => $this->user_name,
            'category_name' => $this->cl_category?->category_name,
            'parent_id' => $this->parent_id,
            'first_name' => $this->cl_user?->first_name,
            'last_name' => $this->cl_user?->last_name,
            'personalNumber' => $this->cl_user?->person_id,
            'address' => $this->cl_user?->address,
            'mobile_number_personal' => $this->cl_user?->mobile,
            'gender' => $this->cl_user?->gender,
            'date' => $this->cl_user?->date_of_birth,
            'distr_code' => $this->distr_code,
            'age' => $this->cl_user?->date_of_birth ? Carbon::parse($this->cl_user->date_of_birth)->age : null,
            'has_cl_user' => $this->cl_user ? true : false,
            'mobile_number_geostat' => $this->g_mobile,
            'tablet_id' => $this->tablet_id,
            'user_id' => $this->user_id,
            'has_smartphone' => $this->cl_user?->has_smartphone,
            'comment' => $this->cl_user?->comment,
            'imei_id' => $this->cl_user?->imei_id,
            'imei' => $this->cl_user?->imei_id ? Imei::find($this->cl_user->imei_id)->IMEI : null,
        ];
    }
}
