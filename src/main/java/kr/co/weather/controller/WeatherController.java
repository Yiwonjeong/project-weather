package kr.co.weather.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class WeatherController {

    @GetMapping("/")
    public String main() {
        log.warn("main page");
        return "/main";
    }

    @GetMapping("/search")
    public String search() {
        log.warn("search page");
        return "/search";
    }

}
