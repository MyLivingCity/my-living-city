const express = require('express');
const axios = require('axios').default;
const { result } = require('lodash');
const locationRouter = express.Router();

const GoogleLocationSearchURLPrefix='https://maps.googleapis.com/maps/api/place/textsearch/json?query=';
const GoogleLocationDetialSearchURLPrefix = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';

locationRouter.post(
    '/searchLocation',
    async(req,res) => {
        try{
            const {lat, lon} = req.body;
            if(!lat || !lon){
                res.status(400).json("lat or lon is missing!");
            }

            //const result = await axios.get(GoogleLocationSearchURLPrefix+'-33.8670522,151.1957362'+'&key='+GOOGLE_MAP_API_KEY);
            const result = await axios.get(`${GoogleLocationSearchURLPrefix}${lat},${lon}&key=${process.env.GOOGLE_MAP_API_KEY}`);
            console.log(result.data.results[0].place_id);

            if(result.data){
                let placeId = result.data.results[0].place_id;
                if(placeId){
                    res.status(200).json({"placeId": placeId});
                }else{
                    res.status(400).json("No placeId was found in results");
                }
            }else{
                res.status(400).json("No query result from google location search!");
            }
        }catch(error){
            console.log(error);
            res.status(400).json("something unexpected happened when querying location information");
        }
    }
)

locationRouter.get(
    '/locationDetails/:placeId',
    async(req,res) => {
        try{
            const {placeId} = req.params;
            //variables for location information
            let country='';
            let province='';
            let city='';
            let city2='';
            // let cities=[];

            if(!placeId){
                res.status(400).json("placeId is missing!");
            }

            const feedback = await axios.get(GoogleLocationDetialSearchURLPrefix+placeId+'&key='+process.env.GOOGLE_MAP_API_KEY);

            const data = feedback.data;
            console.log(data.result.address_components);
            if(data.result.address_components){
                const addressComponents = data.result.address_components;
                addressComponents.forEach((component) => {
                    if(component.types[0]=="locality"){
                        // city = component.long_name.toLowerCase();
                        city = component.long_name.toLowerCase();
                    }
                    else if(component.types[0]=="administrative_area_level_3"){
                        city2 = component.long_name.toLowerCase();
                    }
                    else if(component.types[0]=="administrative_area_level_1"){
                        province = component.long_name.toLowerCase();
                    }else if(component.types[0]=="country"){
                        country = component.long_name.toLowerCase();
                    }
                });
                res.status(200).json({'country':country,'province':province,'city': city, 'city2': city2});
                // res.status(200).json({data});
            }else{
                res.status(400).json("placeId search malfunctioned!");
            }
        }catch(error){
            console.log(error);
            res.status(400).json("something unexpected happened when querying location details");
        }
    }
)

module.exports = locationRouter;